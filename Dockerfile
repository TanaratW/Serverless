FROM jenkins/jenkins:lts

USER root

# ติดตั้ง Docker CLI และ docker-compose
RUN apt-get update && \
    apt-get install -y docker.io docker-compose git && \
    apt-get clean

# เพิ่ม user jenkins เข้า group docker
RUN usermod -aG docker jenkins

# กลับมาใช้ user jenkins
USER jenkins
