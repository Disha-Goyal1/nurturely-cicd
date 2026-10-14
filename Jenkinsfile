pipeline {
    agent any

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
                '''
            }
        }
    }
}
