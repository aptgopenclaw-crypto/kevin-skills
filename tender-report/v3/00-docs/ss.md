cd backend
mvn clean package -DskipTests

# 產出單一 JAR
java -jar target/taipei-streetlight-0.0.1-SNAPSHOT.jar