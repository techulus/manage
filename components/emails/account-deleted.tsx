import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface AccountDeletedProps {
  firstName?: string;
  email: string;
  organizationName?: string;
}

export const AccountDeleted = ({
  firstName,
  email,
  organizationName,
}: AccountDeletedProps) => {
  const isOrganization = !!organizationName;
  const previewText = isOrganization 
    ? `Your Manage organization "${organizationName}" has been deleted`
    : "Your Manage account has been deleted";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>
              {isOrganization ? 'Organization Deleted' : 'Account Deleted'}
            </Heading>
          </Section>
          
          <Section style={content}>
            <Text style={text}>
              Hello {firstName || 'there'},
            </Text>
            
            <Text style={text}>
              {isOrganization ? (
                `Your Manage organization "${organizationName}" has been permanently deleted.`
              ) : (
                `Your Manage account (${email}) has been permanently deleted.`
              )}
            </Text>
            
            <Text style={text}>
              <strong>What this means:</strong>
            </Text>
            
            <Text style={text}>
              {isOrganization ? (
                <>
                  • Your organization has been permanently deleted<br />
                  • All projects, tasks, and data have been removed<br />
                  • This action cannot be undone
                </>
              ) : (
                <>
                  • Your account has been permanently deleted<br />
                  • All projects, tasks, and data have been removed<br />
                  • This action cannot be undone
                </>
              )}
            </Text>
            
            <Text style={text}>
              {isOrganization ? (
                `If you'd like to use Manage again in the future, you're welcome to create a new organization at any time.`
              ) : (
                `If you'd like to use Manage again in the future, you're welcome to create a new account at any time.`
              )}
            </Text>
            
            <Text style={text}>
              Thank you for being part of the Manage community.
            </Text>
            
            <Text style={footer}>
              Best regards,<br />
              The Manage Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 24px',
  borderBottom: '1px solid #e6ebf1',
  backgroundColor: '#f9fafb',
};

const content = {
  padding: '24px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
};

AccountDeleted.PreviewProps = {
  firstName: 'John',
  email: 'john@example.com',
  organizationName: 'Acme Corp',
} as AccountDeletedProps;

export function accountDeletedPlainText({
  firstName,
  email,
  organizationName,
}: AccountDeletedProps): string {
  const isOrganization = !!organizationName;
  
  return `${isOrganization ? 'Organization Deleted' : 'Account Deleted'}

Hello ${firstName || 'there'},

${isOrganization 
  ? `Your Manage organization "${organizationName}" has been permanently deleted.`
  : `Your Manage account (${email}) has been permanently deleted.`}

What this means:
${isOrganization ? `• Your organization has been permanently deleted
• All projects, tasks, and data have been removed
• This action cannot be undone` : `• Your account has been permanently deleted
• All projects, tasks, and data have been removed
• This action cannot be undone`}

${isOrganization 
  ? `If you'd like to use Manage again in the future, you're welcome to create a new organization at any time.`
  : `If you'd like to use Manage again in the future, you're welcome to create a new account at any time.`}

Thank you for being part of the Manage community.

Best regards,
The Manage Team`;
}

export default AccountDeleted;