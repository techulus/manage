create table if not exists "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" integer not null, "image" text, "createdAt" date not null, "updatedAt" date not null);

create table if not exists "session" ("id" text not null primary key, "expiresAt" date not null, "token" text not null unique, "createdAt" date not null, "updatedAt" date not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id"), "activeOrganizationId" text);

create table if not exists "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id"), "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" date, "refreshTokenExpiresAt" date, "scope" text, "password" text, "createdAt" date not null, "updatedAt" date not null);

create table if not exists "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" date not null, "createdAt" date, "updatedAt" date);

create table if not exists "passkey" ("id" text not null primary key, "name" text, "publicKey" text not null, "userId" text not null references "user" ("id"), "credentialID" text not null, "counter" integer not null, "deviceType" text not null, "backedUp" integer not null, "transports" text, "createdAt" date);

create table if not exists "organization" ("id" text not null primary key, "name" text not null, "slug" text not null unique, "logo" text, "createdAt" date not null, "metadata" text);

create table if not exists "member" ("id" text not null primary key, "organizationId" text not null references "organization" ("id"), "userId" text not null references "user" ("id"), "role" text not null, "createdAt" date not null);

create table if not exists "invitation" ("id" text not null primary key, "organizationId" text not null references "organization" ("id"), "email" text not null, "role" text, "status" text not null, "expiresAt" date not null, "inviterId" text not null references "user" ("id"))