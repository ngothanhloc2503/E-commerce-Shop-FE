pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    credentialsId: 'jenkins-gitlab',
                    url: 'https://gitlab.com/ntloc2503/e-commerce-shop-fe.git'
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm install -g @angular/cli'
                sh 'ng build --configuration production'
                // sh 'docker build -t ecommerce-shop-fe .'
            }
        }

        // stage('Push to Docker Hub') {
        //     steps {
        //         script {
        //             docker.withRegistry('https://registry.hub.docker.com', 'DOCKERHUB_CREDENTIALS') {
        //                 sh 'docker push ecommerce-shop-fe'
        //             }
        //         }
        //     }
        // }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
                // Add your deployment steps here, e.g., docker build, kubectl apply
            }
        }
    }
}