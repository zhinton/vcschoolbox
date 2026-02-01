const formSchema = {
  "formName": "NCCD Decision Record",
  "fields": [
    {
      "type": "dropdown",
      "label": "Collection Year",
      "name": "Collection Year",
      "options": [
        "2026",
        "2025"
      ]
    },
    {
      "type": "dropdown",
      "label": "Level of Adjustment",
      "name": "Level of Adjustment",
      "options": [
        "QDTP",
        "Supplementary",
        "Substantial",
        "Extensive"
      ]
    },
    {
      "type": "dropdown",
      "label": "Main Disability Category",
      "name": "Main Disability Category",
      "options": [
        "Cognitive",
        "Physical",
        "Sensory",
        "Social/Emotional"
      ]
    },
    {
      "type": "checkboxGroup",
      "label": "Contributing Categories",
      "name": "Contributing Categories",
      "options": [
        "Cognitive",
        "Physical",
        "Sensory",
        "Social/Emotional"
      ]
    },
    {
      "type": "radio",
      "label": "Evidence of 10+ weeks",
      "name": "Evidence of 10+ weeks",
      "options": [
        "Yes",
        "No"
      ]
    },
    {
      "type": "number",
      "label": "Weeks evidenced",
      "name": "Weeks evidenced"
    },
    {
      "type": "textarea",
      "label": "Functional impact",
      "name": "Functional impact"
    },
    {
      "type": "textarea",
      "label": "Adjustments summary",
      "name": "Adjustments summary"
    },
    {
      "type": "radio",
      "label": "Moderation completed",
      "name": "Moderation completed",
      "options": [
        "Yes",
        "No"
      ]
    },
    {
      "type": "radio",
      "label": "Principal/delegate verification",
      "name": "Principal/delegate verification",
      "options": [
        "Yes",
        "No"
      ]
    }
  ]
};