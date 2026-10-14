pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        IMAGE_NAME = 'nurturely-frontend'
        CONTAINER_NAME = 'nurturely-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t nurturely-frontend:${BUILD_NUMBER} -f frontend/Dockerfile frontend'
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true

                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart unless-stopped \
                        -p 80:80 \
                        ${IMAGE_NAME}:${BUILD_NUMBER}
                '''
            }
        }
    }
}
