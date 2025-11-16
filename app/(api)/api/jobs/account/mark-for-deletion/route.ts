import { clerkClient } from "@clerk/nextjs/server";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq, isNull, lte } from "drizzle-orm";
import { Resend } from "resend";
import {
  DeletionNoticePlainText,
  OrgDeletionNotice,
} from "@/components/emails/org-deletion-notice";
import {
  SevenDayWarning,
  sevenDayWarningPlainText,
} from "@/components/emails/seven-day-warning";
import { opsOrganization } from "@/ops/drizzle/schema";
import { getOpsDatabase } from "@/ops/useOps";

type ClerkOrgData = { createdBy?: string };

async function getOrgCreatorDetails(org: {
  id: string;
  name: string;
  rawData: unknown;
}) {
  const rawData = org.rawData as ClerkOrgData;
  const createdByUserId = rawData?.createdBy;

  if (!createdByUserId) {
    throw new Error(
      `No creator user ID found for organization ${org.name} (${org.id})`,
    );
  }

  try {
    const clerk = await clerkClient();
    const creator = await clerk.users.getUser(createdByUserId);
    const contactEmail = creator.emailAddresses[0]?.emailAddress;
    const firstName = creator.firstName || undefined;

    if (!contactEmail) {
      throw new Error(
        `No email address found for creator of organization ${org.name} (${org.id})`,
      );
    }

    return { contactEmail, firstName };
  } catch (error) {
    console.error(
      `[OrgDeletion] Failed to fetch creator details for user ${createdByUserId}:`,
      error,
    );
    throw new Error(
      `Failed to fetch creator details for organization ${org.name} (${org.id}): ${error}`,
    );
  }
}

export const { POST } = serve(async (context) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log(
    `[OrgDeletion] Resend API Key configured: ${process.env.RESEND_API_KEY ? "Yes" : "No"}`,
  );

  console.log(
    "[OrgDeletion] Starting organization deletion job at",
    new Date().toISOString(),
  );
  const db = await getOpsDatabase();
  const sixtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 60);
  console.log(
    "[OrgDeletion] Looking for orgs inactive since:",
    sixtyDaysAgo.toISOString(),
  );

  // Step 1: Mark organizations for deletion (60 days inactive)
  const orgsToMark = await context.run("fetch-orgs-to-mark", async () => {
    const orgs = await db
      .select()
      .from(opsOrganization)
      .where(
        and(
          lte(opsOrganization.lastActiveAt, sixtyDaysAgo),
          isNull(opsOrganization.markedForDeletionAt),
        ),
      );

    console.log(
      `[OrgDeletion] Found ${orgs.length} organizations to mark for deletion`,
    );
    if (orgs.length > 0) {
      console.log(
        "[OrgDeletion] Organizations to mark:",
        orgs.map((o) => ({
          id: o.id,
          name: o.name,
          lastActiveAt: o.lastActiveAt?.toISOString(),
        })),
      );
    } else {
      console.log(
        "[OrgDeletion] No organizations found that need to be marked for deletion",
      );
    }
    return orgs;
  });

  // Step 2: Send 60-day deletion notice and mark organizations
  await context.run("mark-orgs-for-deletion", async () => {
    if (orgsToMark.length === 0) {
      console.log(
        "[OrgDeletion] Skipping step 2: No organizations to mark for deletion",
      );
      return;
    }

    console.log(
      `[OrgDeletion] Processing ${orgsToMark.length} organizations for 60-day deletion notices`,
    );
    for (const org of orgsToMark) {
      try {
        // Get creator details
        const { contactEmail, firstName } = await getOrgCreatorDetails(org);

        console.log(
          `[OrgDeletion] Processing org ${org.name} (${org.id}), contact email: ${contactEmail}`,
        );
        console.log(
          `[OrgDeletion] Raw org data for ${org.name}:`,
          JSON.stringify(org.rawData, null, 2),
        );

        // Send 60-day deletion notice
        console.log(
          `[OrgDeletion] Sending 60-day notice email to ${contactEmail} for org ${org.name}`,
        );
        const emailResult = await resend.emails.send({
          from: "Manage Team",
          to: contactEmail,
          subject: "Organization Deletion Notice - 60 Days",
          react: OrgDeletionNotice({
            firstName: firstName,
            email: contactEmail,
            organizationName: org.name,
          }),
          text: DeletionNoticePlainText({
            firstName: firstName,
            email: contactEmail,
            organizationName: org.name,
          }),
        });
        console.log(
          `[OrgDeletion] Email send result for ${org.name}:`,
          JSON.stringify(emailResult, null, 2),
        );

        // Mark organization for deletion
        await db
          .update(opsOrganization)
          .set({ markedForDeletionAt: new Date() })
          .where(eq(opsOrganization.id, org.id));

        console.log(
          `[OrgDeletion] Successfully marked organization ${org.name} (${org.id}) for deletion`,
        );
      } catch (error) {
        console.error(
          `[OrgDeletion] Failed to process organization ${org.name} (${org.id}):`,
          error,
        );
      }
    }
  });

  // Step 3: Send 7-day warning to organizations marked 53 days ago
  const orgsFor7DayWarning = await context.run(
    "fetch-orgs-for-7-day-warning",
    async () => {
      const fiftyThreeDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 53);
      const orgs = await db
        .select()
        .from(opsOrganization)
        .where(
          and(
            lte(opsOrganization.markedForDeletionAt, fiftyThreeDaysAgo),
            isNull(opsOrganization.finalWarningAt),
          ),
        );

      console.log(
        `[OrgDeletion] Found ${orgs.length} organizations for 7-day warning`,
      );
      if (orgs.length > 0) {
        console.log(
          "[OrgDeletion] Organizations for 7-day warning:",
          orgs.map((o) => ({
            id: o.id,
            name: o.name,
            markedForDeletionAt: o.markedForDeletionAt?.toISOString(),
          })),
        );
      } else {
        console.log(
          "[OrgDeletion] No organizations found that need 7-day warnings",
        );
      }
      return orgs;
    },
  );

  await context.run("send-7-day-warning", async () => {
    if (orgsFor7DayWarning.length === 0) {
      console.log(
        "[OrgDeletion] Skipping step 3: No organizations need 7-day warnings",
      );
      return;
    }

    console.log(
      `[OrgDeletion] Processing ${orgsFor7DayWarning.length} organizations for 7-day warnings`,
    );
    for (const org of orgsFor7DayWarning) {
      try {
        // Get creator details
        const { contactEmail, firstName } = await getOrgCreatorDetails(org);

        console.log(
          `[OrgDeletion] Sending 7-day warning to org ${org.name} (${org.id}), contact email: ${contactEmail}`,
        );

        // Send 7-day warning
        console.log(
          `[OrgDeletion] Sending 7-day warning email to ${contactEmail} for org ${org.name}`,
        );
        const emailResult = await resend.emails.send({
          from: "Manage Team <noreply@email.managee.xyz>",
          to: contactEmail,
          subject: "Final Warning - Organization Deletion in 7 Days",
          react: SevenDayWarning({
            firstName: firstName,
            email: contactEmail,
            organizationName: org.name,
          }),
          text: sevenDayWarningPlainText({
            firstName: firstName,
            email: contactEmail,
            organizationName: org.name,
          }),
        });
        console.log(
          `[OrgDeletion] 7-day warning email result for ${org.name}:`,
          JSON.stringify(emailResult, null, 2),
        );

        // Mark final warning sent
        await db
          .update(opsOrganization)
          .set({ finalWarningAt: new Date() })
          .where(eq(opsOrganization.id, org.id));

        console.log(
          `[OrgDeletion] Successfully sent 7-day warning for organization ${org.name} (${org.id})`,
        );
      } catch (error) {
        console.error(
          `[OrgDeletion] Failed to send 7-day warning for organization ${org.name} (${org.id}):`,
          error,
        );
      }
    }
  });

  // Step 4: Trigger deletion for organizations marked 60 days ago
  const orgsToTriggerDeletion = await context.run(
    "fetch-orgs-to-trigger-deletion",
    async () => {
      const sixtyDaysAgoForDeletion = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 60,
      );
      const orgs = await db
        .select()
        .from(opsOrganization)
        .where(
          lte(opsOrganization.markedForDeletionAt, sixtyDaysAgoForDeletion),
        );

      console.log(
        `[OrgDeletion] Found ${orgs.length} organizations ready for deletion`,
      );
      if (orgs.length > 0) {
        console.log(
          "[OrgDeletion] Organizations ready for deletion:",
          orgs.map((o) => ({
            id: o.id,
            name: o.name,
            markedForDeletionAt: o.markedForDeletionAt?.toISOString(),
            finalWarningAt: o.finalWarningAt?.toISOString(),
          })),
        );
      } else {
        console.log(
          "[OrgDeletion] No organizations found that are ready for deletion",
        );
      }
      return orgs;
    },
  );

  await context.run("trigger-organization-deletions", async () => {
    if (orgsToTriggerDeletion.length === 0) {
      console.log(
        "[OrgDeletion] Skipping step 4: No organizations ready for deletion",
      );
      return;
    }

    console.log(
      `[OrgDeletion] Triggering deletion for ${orgsToTriggerDeletion.length} organizations`,
    );
    for (const org of orgsToTriggerDeletion) {
      console.log(
        `[OrgDeletion] Triggering deletion for org ${org.name} (${org.id}) via Clerk API`,
      );

      // Delete organization from Clerk, which will trigger the webhook
      // The webhook will handle database deletion and ops cleanup
      const clerk = await clerkClient();
      await clerk.organizations.deleteOrganization(org.id);

      console.log(
        `[OrgDeletion] Successfully triggered deletion for organization ${org.name} (${org.id}). Webhook will handle cleanup.`,
      );
    }
  });

  console.log(
    "[OrgDeletion] Organization deletion job completed at",
    new Date().toISOString(),
  );
});
