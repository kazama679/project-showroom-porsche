# Backend package layout (Phase G)

Root package: `com.ra.base_spring_boot` (unchanged).

```
com.ra.base_spring_boot/
├── BaseSpringBootApplication.java
├── common/
│   ├── base/          BaseObject, BaseCreatedObject
│   ├── constants/     RoleName
│   ├── exception/     Http*, GlobalHandleException
│   └── utils/         TokenHashUtil
├── config/            Redis, Cloudinary, Flyway
├── controller/
│   ├── auth/          AuthController
│   ├── admin/         Admin CRUD + catalog management
│   └── student/       Public/customer flows (car build, inquiry, test drive, configurator)
├── dto/
│   ├── request/       Former dto.req
│   └── response/      Former dto.resp + ResponseWrapper
├── entity/            Former model/* entities
├── repository/
├── security/          JWT, cookies, SecurityConfig, principle/*
└── service/
    ├── I*Service, TokenPair, …
    └── impl/          *ServiceImpl, MailService
```

## Notes

- **`controller.student`**: Java reserved word `public` cannot be a package name; student flows use `controller.student`.
- **URLs unchanged**: `@RequestMapping` paths are identical to pre–Phase G.
- **Phase H (not done)**: Rename `BaseObject` → `BaseEntity`, `principle` → `principal`, optional `I*` naming cleanup.

## Build

```bat
set JAVA_HOME=<JDK-21>
cd backend
.\gradlew.bat clean build
```
