pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20.x'
    }

    environment {
        HARBOR_REGISTRY = 'https://registry-ntloc.ddns.net' // e.g., harbor.mycompany.com
        HARBOR_CREDENTIALS = credentials('harbor-credentials-id')
        GITLAB_REPO = 'https://gitlab.com/ntloc2503/e-commerce-shop-fe.git'
        GITLAB_CREDENTIALS = credentials('jenkins-gitlab')
        APP_NAME = 'e-commerce-shop-fe'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    credentialsId: "${GITLAB_CREDENTIALS}",
                    url: "${GITLAB_REPO}"
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm install -g @angular/cli'
                sh 'ng build --configuration production'
            }
        }

        stage('Push to Harbor') {
            steps {
                script {
                    docker.withRegistry("${HARBOR_REGISTRY}", "${HARBOR_CREDENTIALS}") {
                        // sh 'docker build -t ecommerce-shop-fe .'
                        // sh 'docker push ecommerce-shop-fe'
                        echo "Login successed"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
                // Add your deployment steps here, e.g., docker build, kubectl apply
            }
        }
    }
}