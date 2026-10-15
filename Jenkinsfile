
pipeline {
    agent any

    options {
        timestamps()
    }

 environment {
    PATH+NODE22 = '/usr/local/node22/bin'
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
                    set -eu
                    set +x
                    test -f compose.yaml
                    test -f frontend/Dockerfile
                    test -f Jenkinsfile
                    test -n "$VITE_SUPABASE_URL"
                    test -n "$VITE_SUPABASE_PUBLISHABLE_KEY"
                    docker --version
                    docker compose version
                    docker info --format 'Docker daemon is available (server {{.ServerVersion}}).'
                    docker compose config --quiet
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        set -eu
                        set +x
                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    set -eu
                    set +x
                    docker compose build frontend
                '''
            }
        }

        stage('Deploy and Verify') {
            steps {
                sh '''
                    set -eu
                    set +x
                    docker compose up -d --no-build --wait
                    docker compose ps
                    curl --fail --retry 12 --retry-delay 5 http://127.0.0.1/health
                    curl --fail --retry 3 http://127.0.0.1/login
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
