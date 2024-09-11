pipeline {
    agent any

    stages {
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