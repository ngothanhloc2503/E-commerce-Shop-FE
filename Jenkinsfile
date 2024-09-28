pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20.x'
    }

    environment {
        HARBOR_REGISTRY = 'https://registry-ntloc.ddns.net' // e.g., harbor.mycompany.com
        HARBOR_CREDENTIALS = credentials('harbor-credentials-id')
        GITLAB_REPO = 'https://gitlab.com/ntloc2503/e-commerce-shop-fe.git'
        APP_NAME = 'e-commerce-shop-fe'
        DOCKER_IMAGE = "${HARBOR_REGISTRY}/e-commerce-shop/${APP_NAME}:lastest"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    credentialsId: 'jenkins-gitlab',
                    url: "${GITLAB_REPO}"
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build --configuration=production'
            }
        }

        stage('Push to Harbor') {
            steps {
                script {
                    docker.withRegistry("${HARBOR_REGISTRY}", "${HARBOR_CREDENTIALS}") {
                        sh "docker build -t ${DOCKER_IMAGE} ."
                        sh "docker push ${DOCKER_IMAGE}"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
            }
        }
    }
}