pipeline {
    agent any
    tools {
        nodejs "NodeJS 20.17.0"  // Use the name you configured in the Global Tool Configuration
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    credentialsId: 'gitlab-token',
                    url: 'https://gitlab.com/ntloc2503/e-commerce-shop-fe.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npm install -g @angular/cli'
            }
        }

        stage('Build') {
            steps {
                sh 'ng build --configuration production'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
                // Add your deployment steps here, e.g., docker build, kubectl apply
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed'
        }
        success {
            echo 'Pipeline succeeded'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}