const mongoose = require('mongoose');

const labValueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number },
  unit: { type: String },
  referenceMin: { type: Number },
  referenceMax: { type: Number },
  status: { type: String, enum: ['normal', 'borderline', 'critical'], default: 'normal' },
  explanation: { type: String },
  category: { type: String }
});

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyMemberName: { type: String, default: 'Self' },
  reportType: { 
    type: String, 
    enum: ['blood', 'thyroid', 'liver', 'kidney', 'lipid', 'diabetes', 'cbc', 'urine', 'other'],
    default: 'other'
  },
  labName: { type: String },
  reportDate: { type: Date },
  originalImage: { type: String },
  rawOcrText: { type: String },
  labValues: [labValueSchema],
  summary: { type: String },
  summaryLanguage: { type: String, default: 'en' },
  overallStatus: { type: String, enum: ['normal', 'attention', 'urgent'], default: 'normal' },
  doctorRecommendation: { type: String },
  clinicalGuidance: {
    findings: [{
      name: String,
      value: mongoose.Schema.Types.Mixed,
      unit: String,
      referenceRange: String,
      status: String
    }],
    concerns: [{ type: String }],
    nextSteps: [{ type: String }],
    specialistType: { type: String },
    urgencyLevel: { type: String },
    disclaimer: { type: String }
  },
  aiModel: { type: String, default: 'gemini-2.5-flash' },
  analysisSource: { type: String, enum: ['api', 'fallback'], default: 'api' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
