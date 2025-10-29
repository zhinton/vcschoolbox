export const PastoralCare = [
  {
    order: 1,
    name: "Submit Notification",
    description: "Promts users to select a subtype if 'Not Selected' is chosen. You will need to add the Subtype 'Not Selected' to your subtype lists for this to work.",
    fileName: "submitNotification.js"
  },
  {
    order: 3,
    name: "Hover Effect",
    description: "This makes and image appear when hovering over the category field in pastoral care.",
    fileName: "hoverEffect.js",
    options: [
      {
        key: "imageID",
        label: "Image ID",
        description: "Enter the image ID from your Schoolbox instance.",
        help_text: "To find this, add your image to Schoolbox and open the image through the resource browser. You will find the ID in the URL after send.php?id="
      },
      {
        key: "imageHeight",
        label: "Image Height",
        description: "Enter the desired image height (px).",
        help_text: "Specify the height in pixels, e.g. 300 for 300px."
      },
      {
        key: "imageWidth",
        label: "Image Width",
        description: "Enter the desired image width (px).",
        help_text: "Specify the width in pixels, e.g. 400 for 400px."
      }
    ]
  },
  {
    order: 5,
    name: "Subtype Alert",
    description: "Provides notification alerts for selected subtypes/notification pairs.",
    fileName: "subtypeAlert.js",
    options: [
      {
        key: "subtypeAlertPairs",
        label: "Subtype/Message Pairs",
        description: "Add pairs of Subtype and the message to display.",
        help_text: "Enter each Subtype and its corresponding message."
      }
    ]
  },
  {
    order: 4,
    name: "Action Checker",
    description: "Links actions to Tags. To help refine the actions being taken. The message is a prompt to the user to ensure they are taking the correct action.",
    fileName: "actionChecker.js",
    options: [
      {
        key: "actions",
        label: "Actions",
        description: "Enter the list of actions to check.",
        help_text: "List the actions you want to validate, separated by commas."
      },
      {
        key: "tagLists",
        label: "Tag Lists",
        description: "Enter a comma-separated list of tags for each action.",
        help_text: "For each action, enter the tags separated by commas."
      },
      {
        key: "messages",
        label: "Messages",
        description: "Enter the message to display for each action.",
        help_text: "Provide the message that will be shown to the user for each action."
      }
    ]
  },
  {
    order: 6,
    name: "Subtype Severity",
    description: "Auto selecting severity/category based on the subtype selected.",
    fileName: "subtypeSeverity.js",
    options: [
      {
        key: "subtypeSeverityPairs",
        label: "Subtype/Category Pairs",
        description: "Add pairs of Subtype and Category.",
        help_text: "Enter each Subtype and its corresponding Category."
      }
    ]
  },
  {
    order: 2,
    name: "Forced Confidential",
    description: "Forces users to enter details in the confidential tab. Please indicate the type that should trigger this behavior.",
    fileName: "forcedConfidential.js",
    options: [
      {
        key: "type",
        label: "Type",
        description: "Enter the type for forced confidential.",
        help_text: "Specify the type that should trigger forced confidential behavior."
      }
    ]
  },
];
export const Emailing = [
  {
    name: "External Email Domains",
    description: "Will prompt the user if they are sending an email to an external domain. to make sure documentation is followed. if needed",
    fileName: "emailChecker.js"
  },
  // Add more objects as needed
];
export const New = [
  {
    name: "Parent News",
    description: "Displays a warning notification when publishing news items to campus audiences, or other selected audiences, to ensure the user is aware of the audience being targeted.",
    fileName: "parentNews.js"
  },
  // Add more objects as needed
];
