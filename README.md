<img width="100" src="https://github.com/techulus/manage/blob/main/public/images/logo.png?raw=true" />

## Manage

Manage is an open-source project management app inspired by Basecamp. With its intuitive interface, customizable features, and emphasis on collaboration, Manage empowers teams to enhance productivity and achieve project success. Enjoy the benefits of open-source flexibility, data security, and a thriving community while managing your projects efficiently with Manage.

> **Warning**
> This app is a work in progress. I'm building this in public. You can follow the progress on Twitter [@arjunz](https://twitter.com/arjunz).
> See the roadmap below.

## V1 Roadmap

- [x] Users / teams management (Currently using LogTo)
- [x] Basic Project management
- [x] Task lists and tasks
- [x] Documents - Creating and sharing markdown documents
- [x] Files - Uploading and sharing files
- [x] Comments
- [x] Events / Calendar
- [ ] Activity logs
- [ ] Notifications
- [ ] Discussions / Forums
- [ ] Chat
- [ ] Search
- [ ] Permissions
- [ ] Billing

## Development

### Environment

```
# Logto for Auth
LOGTO_ENDPOINT=
LOGTO_APP_ID=""
LOGTO_APP_SECRET=""
LOGTO_BASE_URL=""
LOGTO_COOKIE_SECRET=""
LOGTO_M2M_APP_ID=""
LOGTO_M2M_APP_SECRET=""

# Any S3 compatible storage
S3_BUCKET_ENDPOINT="
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_BUCKET_NAME=""
```

### Run using Docker

```bash
docker-compose up
```

## Note on Performance

> **Warning**
> This app is still in development. It's not ready for production use.
> **Expect some bugs & performance hits when testing**.
> If you see something broken, you can ping me [@arjunz](https://twitter.com/arjunz).

## License

Licensed under the [GNU AFFERO GENERAL PUBLIC LICENSE](https://github.com/techulus/manage/blob/main/LICENSE).
