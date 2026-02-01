const formSchema = {
  "formName": "Behaviour Incident Report",
  "fields": [
    {
      "type": "date",
      "label": "Incident Date",
      "name": "Incident Date",
      "halfWidth": true,
      "required": true
    },
    {
      "type": "text",
      "label": "Student Name",
      "name": "Student Name",
      "halfWidth": true,
      "required": true
    },
    {
      "type": "dropdown",
      "label": "Year Level",
      "name": "Year Level",
      "options": [
        "Prep",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6"
      ],
      "halfWidth": true
    },
    {
      "type": "textarea",
      "label": "Incident Description",
      "name": "Incident Description",
      "required": true
    },
    {
      "type": "checkboxGroup",
      "label": "Actions Taken",
      "name": "Actions Taken",
      "options": [
        "Parent contact",
        "Detention",
        "Referral to counsellor",
        "Classroom management"
      ]
    },
    {
      "type": "radio",
      "label": "Follow-up required",
      "name": "Follow-up required",
      "options": [
        "Yes",
        "No"
      ]
    }
  ]
};