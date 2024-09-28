pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20.x'
    }

    environment {
        HARBOR_REGISTRY = 'registry-ntloc.ddns.net'
        GITLAB_REPO = 'https://gitlab.com/ntloc2503/e-commerce-shop-fe.git'
        DOCKER_IMAGE = "${HARBOR_REGISTRY}/e-commerce-shop/e-commerce-shop-fe:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    credentialsId: 'gitlab-credentials-id',
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
                    // Log in to the Harbor registry
                    withCredentials([usernamePassword(credentialsId: 'harbor-credentials-id', passwordVariable: 'HARBOR_PASSWORD', usernameVariable: 'HARBOR_USERNAME')]) {
                        sh "echo ${HARBOR_PASSWORD} | docker login ${HARBOR_REGISTRY} -u ${HARBOR_USERNAME} --password-stdin"
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