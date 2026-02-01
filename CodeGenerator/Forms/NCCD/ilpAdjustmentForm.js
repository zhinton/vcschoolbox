const formSchema = {
  "formName": "ILP / Adjustment Plan",
  "fields": [
    {
      "type": "date",
      "label": "Plan Start Date",
      "name": "Plan Start Date",
      "halfWidth": true
    },
    {
      "type": "date",
      "label": "Plan End Date",
      "name": "Plan End Date",
      "halfWidth": true
    },
    {
      "type": "dropdown",
      "label": "Review Schedule",
      "name": "Review Schedule",
      "options": [
        "Fortnightly",
        "Monthly",
        "Termly",
        "Annually"
      ],
      "halfWidth": true
    },
    {
      "type": "text",
      "label": "Responsible Staff",
      "name": "Responsible Staff",
      "halfWidth": true
    },
    {
      "type": "textarea",
      "label": "Learning Goals",
      "name": "Learning Goals"
    },
    {
      "type": "checkboxGroup",
      "label": "Adjustments Provided",
      "name": "Adjustments Provided",
      "options": [
        "Personalised literacy/numeracy",
        "Modified task",
        "Project-based learning",
        "Alternative engagement",
        "1:1 support",
        "Scribe",
        "First/then/next",
        "Text-to-voice",
        "Explicit instruction",
        "Restatement/rephrasing",
        "Modified instructions",
        "Break down task",
        "Executive functioning",
        "Additional time"
      ]
    },
    {
      "type": "radio",
      "label": "Consultation occurred",
      "name": "Consultation occurred",
      "options": [
        "Yes",
        "No"
      ]
    }
  ]
};
