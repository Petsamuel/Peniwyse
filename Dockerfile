# Use Node.js as the base image
FROM node:20-alpine

# Create and set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if present) to the working directory
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Create .env.production
ARG NEXT_PUBLIC_API_V2_URL
ARG NEXT_PUBLIC_SSO_URL
ARG NEXT_PUBLIC_BASE_PROFILE_API
ARG NEXT_PUBLIC_ACCOUNT_API_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_COOKIE_DOMAIN
ARG NEXT_PUBLIC_SSO_CLIENT_ID
ARG NEXT_PUBLIC_DIGIT_SCHOOL_URL
ARG NEXT_PUBLIC_SSO_CLIENT_SECRET
ARG NEXT_PUBLIC_VAS_API_URL
ARG NEXT_PUBLIC_CREDPAY_SWITCH_API_URL
ARG NEXT_PUBLIC_POSTBRIDGE_API_URL
ARG NEXT_KOLO_SAVING_BASE_URL
ARG NEXT_PUBLIC_APP_KYC_PROFILE
ARG NEXT_PUBLIC_BASE_API_URL



RUN touch .env.production \
 && echo "NEXT_KOLO_SAVING_BASE_URL=$NEXT_KOLO_SAVING_BASE_URL" >> .env.production \
 && echo "NEXT_PUBLIC_API_V2_URL=$NEXT_PUBLIC_API_V2_URL" >> .env.production \
 && echo "NEXT_PUBLIC_SSO_URL=$NEXT_PUBLIC_SSO_URL" >> .env.production \
 && echo "NEXT_PUBLIC_BASE_PROFILE_API=$NEXT_PUBLIC_BASE_PROFILE_API" >> .env.production \
 && echo "NEXT_PUBLIC_ACCOUNT_API_URL=$NEXT_PUBLIC_ACCOUNT_API_URL" >> .env.production \
 && echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> .env.production \
 && echo "NEXT_PUBLIC_POSTBRIDGE_API_URL=$NEXT_PUBLIC_CRM_NEXT_PUBLIC_POSTBRIDGE_API_URLDASHBOARD_URL" >> .env.production \
 && echo "NEXT_PUBLIC_COOKIE_DOMAIN=$NEXT_PUBLIC_COOKIE_DOMAIN" >> .env.production \
 && echo "NEXT_PUBLIC_SSO_CLIENT_ID=$NEXT_PUBLIC_SSO_CLIENT_ID" >> .env.production \
 && echo "NEXT_PUBLIC_DIGIT_SCHOOL_URL=$NEXT_PUBLIC_DIGIT_SCHOOL_URL" >> .env.production \
 && echo "NEXT_PUBLIC_SSO_CLIENT_SECRET=$NEXT_PUBLIC_SSO_CLIENT_SECRET" >> .env.production \
 && echo "NEXT_PUBLIC_CREDPAY_SWITCH_API_URL=$NEXT_PUBLIC_CREDPAY_SWITCH_API_URL" >> .env.production \
 && echo "NEXT_PUBLIC_VAS_API_URL=$NEXT_PUBLIC_VAS_API_URL" >> .env.production \
 && echo "NEXT_PUBLIC_APP_KYC_PROFILE=$NEXT_PUBLIC_APP_KYC_PROFILE" >> .env.production \
 && echo "NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL" >> .env.production \

 && cat .env.production

# Build the Next.js application
RUN npm run build

# Expose the port that Next.js is running on (default is 3000)
EXPOSE 3000
ENV PORT 3000

# Set the command to start the application
CMD ["npm", "start"]