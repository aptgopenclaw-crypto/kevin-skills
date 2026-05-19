  datasource:
    url: jdbc:postgresql://localhost:5432/mydb?currentSchema=tenderdb
    username: postgres
    password: ${DB_PASSWORD:Kali1234!}
    hikari:
      schema: tenderdb
      maximum-pool-size: 10

      