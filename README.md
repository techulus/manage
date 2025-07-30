<img width="100" src="https://github.com/techulus/manage/blob/main/public/images/logo.png?raw=true" />

## Manage

Manage is an open-source project management platform. With its intuitive interface, customizable features, and emphasis on collaboration, Manage empowers teams to enhance productivity and achieve project success. Enjoy the benefits of open-source flexibility, data security, and a thriving community while managing your projects efficiently with Manage.

> **Warning**
> This app is a work in progress. I'm building this in public. You can follow the progress on Twitter [@arjunz](https://twitter.com/arjunz).
> See the roadmap below.

## V1 Roadmap

- [x] Basic Project management
- [x] Task lists and tasks
- [x] Files - Uploading and sharing files
- [x] Comments
- [x] Events / Calendar
- [x] Activity logs
- [x] Search
- [x] Permissions
- [ ] Notifications
- [ ] Posts & files

## Development

### Environment

```
# Auth
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# Any S3 compatible storage
S3_ENDPOINT="
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_BUCKET_NAME=""

# TurboWire for Websockets
TURBOWIRE_DOMAIN=
TURBOWIRE_SIGNING_KEY=
TURBOWIRE_BROADCAST_KEY=

# Email
RESEND_API_KEY=

# Workflows
QSTASH_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Search
UPSTASH_SEARCH_URL=
UPSTASH_SEARCH_TOKEN=
```

### Run using Docker

```bash
docker-compose up
```

## Deployment

<a href="https://railway.com?referralCode=techulus">
  <img src="https://railway.com/brand/logotype-light.png" alt="Railway" height="70" />
</a>

Manage is hosted on [Railway](https://railway.com?referralCode=techulus), a modern platform that makes deploying applications simple and fast. Railway provides excellent developer experience with features like automatic deployments, built-in databases, and seamless scaling.

## Note on Performance

> **Warning**
> This app is still in development.
> If you see something broken, you can ping me [@arjunz](https://twitter.com/arjunz).

## License

Licensed under the [GNU AFFERO GENERAL PUBLIC LICENSE](https://github.com/techulus/manage/blob/main/LICENSE).
