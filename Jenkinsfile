pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'gitlab-credentials',
                    url: 'https://gitlab.com/ntloc2503/e-commerce-shop-fe.git'
            }
        }

        stage('Build') {
            steps {
                echo 'Building...'
                // Add your build commands here, e.g., npm build, mvn clean install
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                // Add your testing commands here, e.g., npm test, mvn test
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