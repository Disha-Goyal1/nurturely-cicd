pipeline {
    agent any

<<<<<<< HEAD
    environment {
        VITE_SUPABASE_URL = credentials('nurturely-supabase-url')
        VITE_SUPABASE_PUBLISHABLE_KEY = credentials('nurturely-supabase-publishable-key')
    }

    stages {
        stage('Build frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose up -d --build
                    curl --fail --retry 12 --retry-delay 5 http://127.0.0.1/health
                    curl --fail --retry 3 http://127.0.0.1/login
=======
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
>>>>>>> 93f77196d6687112d32d86a15199e6848872b211
                '''
            }
        }
    }
}
