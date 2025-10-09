#!/bin/bash

# CheckOnMe Lambda Deployment Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
STAGE="dev"
FUNCTION=""
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--stage)
            STAGE="$2"
            shift 2
            ;;
        -f|--function)
            FUNCTION="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -s, --stage STAGE      Deployment stage (dev, staging, prod)"
            echo "  -f, --function FUNC    Deploy specific function only"
            echo "  -v, --verbose          Verbose output"
            echo "  -h, --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                     Deploy all functions to dev stage"
            echo "  $0 -s prod             Deploy all functions to prod stage"
            echo "  $0 -f processEscalations -s dev    Deploy only escalation function"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Starting CheckOnMe Lambda deployment..."
print_status "Stage: $STAGE"
if [[ -n "$FUNCTION" ]]; then
    print_status "Function: $FUNCTION"
else
    print_status "Function: All functions"
fi

# Check if we're in the lambda directory
if [[ ! -f "serverless.yml" ]]; then
    print_error "serverless.yml not found. Please run this script from the lambda directory."
    exit 1
fi

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure'."
    exit 1
fi

print_success "AWS credentials verified"

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    print_error "Serverless Framework is not installed. Please install it with: npm install -g serverless"
    exit 1
fi

print_success "Serverless Framework found"

# Install dependencies if node_modules doesn't exist
if [[ ! -d "node_modules" ]]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Validate environment variables for production
if [[ "$STAGE" == "prod" ]]; then
    print_warning "Deploying to PRODUCTION stage!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
    
    # Check for required production environment variables
    if [[ -z "$DYNAMODB_TABLE_NAME" ]]; then
        print_warning "DYNAMODB_TABLE_NAME not set. Using default: checkonme-prod"
    fi
fi

# Deploy functions
print_status "Starting deployment..."

if [[ -n "$FUNCTION" ]]; then
    # Deploy specific function
    print_status "Deploying function: $FUNCTION"
    if [[ "$VERBOSE" == true ]]; then
        serverless deploy function -f "$FUNCTION" --stage "$STAGE" --verbose
    else
        serverless deploy function -f "$FUNCTION" --stage "$STAGE"
    fi
else
    # Deploy all functions
    print_status "Deploying all functions..."
    if [[ "$VERBOSE" == true ]]; then
        serverless deploy --stage "$STAGE" --verbose
    else
        serverless deploy --stage "$STAGE"
    fi
fi

# Check deployment status
if [[ $? -eq 0 ]]; then
    print_success "Deployment completed successfully!"
    
    # Show service info
    print_status "Getting service information..."
    serverless info --stage "$STAGE"
    
    # Show useful commands
    echo ""
    print_status "Useful commands:"
    echo "  View logs:     npm run logs:escalation"
    echo "  View logs:     npm run logs:sms"
    echo "  Test function: npm run invoke:escalation"
    echo "  Remove stack:  serverless remove --stage $STAGE"
    
else
    print_error "Deployment failed!"
    exit 1
fi