const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
            trim: true
        },
        description:{
            type: String,
            required: true
        },
        duration:{
            type: Number,
            required: true
        },
        genre:{
            type: [String],
            required: true
        },
        language:{
            type: String,
            default: "English"
        },
        rating:{
            type: Number,
            min: 0,
            max: 10
        },
        posterUrl:{
            type: String
        },
        bannerUrl: {
            type: String
        },
        trailerUrl:{
            type: String
        },
        status: {
            type: String,
            enum: ["now", "soon"],
            default: "soon"
        },
        averageRating: {
            type: Number,
            default: 0
        },
        reviewCount: {
            type: Number,
            default: 0
        }
    },
    {timestamps: true}
);

// Indexes for search performance
movieSchema.index({ genre: 1 });
movieSchema.index({ language: 1 });
movieSchema.index({ title: 'text' });

module.exports = mongoose.model("Movie", movieSchema);