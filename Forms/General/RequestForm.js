
const formSchema = {
  "formName": "Request Form",
  "fields": [
    {
      "type": "date",
      "label": "Request Date",
      "name": "Request Date",
      "halfWidth": true
    },
    {
      "type": "text",
      "label": "Requested By",
      "name": "Requested By",
      "halfWidth": true,
      "required": true
    },
    {
      "type": "dropdown",
      "label": "Request Type",
      "name": "Request Type",
      "options": [
        "Resource",
        "Leave",
        "Assistance",
        "Information"
      ]
    },
    {
      "type": "textarea",
      "label": "Details",
      "name": "Details",
      "required": true
    },
    {
      "type": "radio",
      "label": "Urgency",
      "name": "Urgency",
      "options": [
        "Low",
        "Medium",
        "High"
      ]
    }
  ]
};