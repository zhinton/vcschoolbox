const formSchema = {
  "formName": "Referral Form",
  "fields": [
    {
      "type": "date",
      "label": "Referral Date",
      "name": "Referral Date",
      "halfWidth": true,
      "required": true
    },
    {
      "type": "text",
      "label": "Referrer Name",
      "name": "Referrer Name",
      "halfWidth": true,
      "required": true
    },
    {
      "type": "text",
      "label": "Student Name",
      "name": "Student Name",
      "required": true
    },
    {
      "type": "dropdown",
      "label": "Referral Type",
      "name": "Referral Type",
      "options": [
        "Health",
        "Counselling",
        "Learning Support",
        "Other"
      ]
    },
    {
      "type": "textarea",
      "label": "Reason for Referral",
      "name": "Reason for Referral",
      "required": true
    },
    {
      "type": "checkboxGroup",
      "label": "Documents Included",
      "name": "Documents Included",
      "options": [
        "Report",
        "Assessment",
        "Medical Note",
        "Other"
      ]
    }
  ]
};