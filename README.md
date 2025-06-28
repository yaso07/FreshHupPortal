## Sample user credentials:

email:yasoyasodharan29@gmail.com
password:yaso4456

# Customer Support Portal

A web-based portal for view customer support tickets, integrating with Freshdesk and HubSpot APIs. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features
- User authentication (register/login)
- Configure Freshdesk and HubSpot API credentials
- View support tickets from Freshdesk
- View webhook logs
- Responsive, modern UI

## Prerequisites
- Node.js 
- npm 

## Getting Started

### 1. Clone the repository



### 2. Install dependencies

npm install


### 3. Start the development server
npm run dev
 
### 4. Build for production

npm run build


## Usage
1. **Register or Login:**
   - On first , register a new account or log in with existing credentials.
2. **Configure APIs:**

   - After login, add your Freshdesk API Key and Domain, and/or your HubSpot Access Token using the configuration forms.
   - Credentials are required to access the dashboard features.

   steps:
     To connect your Freshdesk account, you'll need your API key and domain. After signing up at freshdesk.com, log into your dashboard and click on your profile icon in the top-right corner → Profile Settings. There, you'll find your API key. Your domain is the subdomain of your Freshdesk domain name, typically in the format locker.freshdesk.com. so your domain is locker . Use both of these to authenticate API requests from the app.

     or refer this docs [https://developers.freshdesk.com/api/#getting-started]


     To connect your HubSpot account, you’ll need a Private App Token. Log in to your HubSpot account and navigate to Settings → Integrations → Private Apps. Create a new private app with the required scopes (e.g., crm.objects.contacts.read).ensure you enable the crm.objects.contacts.read scope, which is required to fetch contact information and generate the access token. Copy this token and use it in the app to authorize HubSpot API requests. For more details, refer to HubSpot’s Private Apps documentation.
     ## private App creation : [https://developers.hubspot.com/docs/guides/apps/private-apps/overview] 

     API for contacts (ref): [https://developers.hubspot.com/docs/reference/api/crm/objects/contacts#post-%2Fcrm%2Fv3%2Fobjects%2Fcontacts%2Fsearch]

    ## for web hook integration:[https://github.com/yaso07/FreshHupTicketPortalBackend/blob/develop/README.md]

3. **Dashboard:**
   - View tickets from Freshdesk and webhook logs.
   - Click on a ticket to view its details in a modal, and also show HubSpot CRM contact info if the requester's email (from Freshdesk) matches a contact in HubSpot.
 
## Environment Variables
If your project requires environment variables (e.g for backend URLs), create a `.env` file in the root directory. 


## Customization
- Update styles as needed.
- Tailwind CSS is used for styling.

