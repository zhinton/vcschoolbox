const formSchema = {
  "formName": "Consultation Record",
  "fields": [
    {
      "type": "date",
      "label": "Date",
      "name": "Date"
    },
    {
      "type": "text",
      "label": "Participants",
      "name": "Participants"
    },
    {
      "type": "dropdown",
      "label": "Mode",
      "name": "Mode",
      "options": [
        "In-person",
        "Phone",
        "Email",
        "Video"
      ]
    },
    {
      "type": "text",
      "label": "Purpose",
      "name": "Purpose"
    },
    {
      "type": "textarea",
      "label": "Agreed Actions",
      "name": "Agreed Actions"
    },
    {
      "type": "text",
      "label": "Documents Shared",
      "name": "Documents Shared"
    },
    {
      "type": "textarea",
      "label": "Consent Notes",
      "name": "Consent Notes"
    }
  ]
};
