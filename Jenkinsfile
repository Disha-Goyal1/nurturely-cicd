
pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        VITE_SUPABASE_URL = credentials('nurturely-supabase-url')
        VITE_SUPABASE_PUBLISHABLE_KEY = credentials('nurturely-supabase-publishable-key')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Project Files') {
            steps {
                sh '''
                    test -f compose.yaml
                    test -f frontend/Dockerfile
                    test -f Jenkinsfile
                    echo "Required project files found."
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Build and Deploy') {
            steps {
                sh '''
                    docker compose up -d --build
                    docker compose ps
                '''
            }
        }
    }

    post {
        success {
            echo 'Nurturely pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the stage logs in Console Output.'
        }
    }
}
