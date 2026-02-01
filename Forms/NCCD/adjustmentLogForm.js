const formSchema = {
  "formName": "NCCD Adjustment Log",
  "fields": [
    {
      "type": "dropdown",
      "label": "Adjustment Type",
      "name": "Adjustment Type",
      "options": [
        "Curriculum",
        "Teaching",
        "Assessment",
        "Environment",
        "Assistive Tech",
        "Health/Safety",
        "Behaviour",
        "Staffing"
      ]
    },
    {
      "type": "date",
      "label": "Start Date",
      "name": "Start Date",
      "halfWidth": true
    },
    {
      "type": "date",
      "label": "End Date",
      "name": "End Date",
      "halfWidth": true
    },
    {
      "type": "dropdown",
      "label": "Frequency",
      "name": "Frequency",
      "options": [
        "Daily",
        "Most Days",
        "Some Days",
        "Occasional"
      ]
    },
    {
      "type": "text",
      "label": "Setting",
      "name": "Setting"
    },
    {
      "type": "dropdown",
      "label": "Intensity",
      "name": "Intensity",
      "options": [
        "Low",
        "Medium",
        "High"
      ]
    },
    {
      "type": "textarea",
      "label": "Strategies",
      "name": "Strategies"
    },
    {
      "type": "textarea",
      "label": "Notes",
      "name": "Notes"
    },

  ]
};