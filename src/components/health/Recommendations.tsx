import { CheckCircle2, Utensils, Dumbbell, Heart, Moon } from "lucide-react";

interface RecommendationsProps {
  riskLevel: "low" | "medium" | "high";
  type: "pcos" | "menstrual" | "menopause";
  age?: number;
}

const dietRecommendations = {
  pcos: {
    low: {
      eat: ["Whole grains", "Leafy vegetables", "Lean proteins", "Berries", "Nuts & seeds"],
      avoid: ["Processed foods", "Sugary drinks", "Refined carbs"],
      meal: "Breakfast: Oatmeal with berries | Lunch: Grilled chicken salad | Dinner: Salmon with vegetables",
    },
    medium: {
      eat: ["Low-GI foods", "High-fiber vegetables", "Omega-3 rich fish", "Legumes", "Anti-inflammatory spices"],
      avoid: ["White bread & pasta", "Sugary snacks", "Red meat", "Dairy (if sensitive)"],
      meal: "Breakfast: Smoothie with spinach & chia | Lunch: Quinoa bowl | Dinner: Baked fish with sweet potato",
    },
    high: {
      eat: ["Very low-GI foods", "Non-starchy vegetables", "Plant proteins", "Flaxseeds", "Green tea"],
      avoid: ["All refined sugars", "Processed carbs", "Fried foods", "Alcohol", "Caffeine"],
      meal: "Breakfast: Eggs with avocado | Lunch: Large salad with chickpeas | Dinner: Grilled vegetables with tofu",
    },
  },
  menstrual: {
    low: {
      eat: ["Iron-rich foods", "Vitamin C fruits", "Whole grains", "Dark chocolate", "Water-rich foods"],
      avoid: ["Excessive salt", "Caffeine during period", "Alcohol"],
      meal: "Breakfast: Spinach omelette | Lunch: Lentil soup | Dinner: Lean beef with broccoli",
    },
    medium: {
      eat: ["Leafy greens", "Ginger & turmeric", "Bananas", "Salmon", "Chamomile tea"],
      avoid: ["Processed foods", "High sodium foods", "Sugary snacks"],
      meal: "Breakfast: Banana smoothie | Lunch: Kale salad | Dinner: Grilled salmon with asparagus",
    },
    high: {
      eat: ["Anti-inflammatory foods", "Magnesium-rich foods", "Omega-3 fatty acids", "Herbal teas", "Hydrating foods"],
      avoid: ["Inflammatory foods", "Trans fats", "Excessive dairy", "Spicy foods during period"],
      meal: "Breakfast: Chia pudding | Lunch: Buddha bowl | Dinner: Vegetable stir-fry with brown rice",
    },
  },
  menopause: {
    low: {
      eat: ["Calcium-rich foods", "Vitamin D sources", "Soy products", "Whole grains", "Fruits & vegetables"],
      avoid: ["Excessive caffeine", "Alcohol", "Spicy foods (if hot flashes)"],
      meal: "Breakfast: Greek yogurt with almonds | Lunch: Tofu stir-fry | Dinner: Grilled fish with calcium-rich greens",
    },
    medium: {
      eat: ["Phytoestrogen foods", "Flaxseeds", "Legumes", "Fatty fish", "Leafy greens"],
      avoid: ["Sugar", "Processed foods", "Saturated fats", "Hot beverages (if hot flashes)"],
      meal: "Breakfast: Flaxseed smoothie | Lunch: Edamame salad | Dinner: Salmon with kale",
    },
    high: {
      eat: ["High calcium foods", "Vitamin K vegetables", "Protein-rich foods", "Bone broth", "Fermented foods"],
      avoid: ["All sugars", "Refined carbs", "Alcohol", "Caffeine", "Trigger foods"],
      meal: "Breakfast: Egg white frittata | Lunch: Sardine salad | Dinner: Bone broth soup with vegetables",
    },
  },
};

const exerciseRecommendations = {
  pcos: {
    low: ["30 min brisk walking daily", "Swimming 2x/week", "Yoga 2x/week", "Light strength training"],
    medium: ["45 min cardio 5x/week", "HIIT 2x/week", "Yoga for stress 3x/week", "Strength training 2x/week"],
    high: ["Daily walking 60 min", "Low-impact aerobics", "Yoga & meditation daily", "Resistance training 3x/week"],
  },
  menstrual: {
    low: ["Regular cardio", "Strength training", "Yoga", "Stretching"],
    medium: ["Moderate walking during period", "Gentle yoga", "Light stretching", "Swimming"],
    high: ["Very gentle movement", "Restorative yoga", "Short walks", "Deep breathing exercises"],
  },
  menopause: {
    low: ["Weight-bearing exercises", "Balance training", "Cardio 3-5x/week", "Flexibility work"],
    medium: ["Daily walking 45 min", "Strength training 3x/week", "Tai Chi", "Swimming"],
    high: ["Bone-strengthening exercises", "Daily movement", "Water aerobics", "Chair yoga"],
  },
};

export const Recommendations = ({ riskLevel, type, age }: RecommendationsProps) => {
  const diet = dietRecommendations[type][riskLevel];
  const exercise = exerciseRecommendations[type][riskLevel];

  return (
    <div className="space-y-6">
      {/* Diet Section */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-teal" />
          Diet Recommendations
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="font-medium text-foreground mb-3 text-teal">Foods to Eat</h4>
            <ul className="space-y-2">
              {diet.eat.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-3 text-destructive">Foods to Avoid</h4>
            <ul className="space-y-2">
              {diet.avoid.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-destructive text-xs">✕</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-teal/10 border border-teal/20">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-teal" />
            Sample Meal Plan
          </h4>
          <p className="text-sm text-muted-foreground">{diet.meal}</p>
        </div>
      </div>

      {/* Exercise Section */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-accent" />
          Exercise Recommendations
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-3">
          {exercise.map((item) => (
            <div
              key={item}
              className="p-3 rounded-xl bg-accent/10 text-sm text-foreground flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Lifestyle Tips */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          Lifestyle Tips
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <div className="text-2xl mb-2">😴</div>
            <div className="font-semibold text-foreground mb-1">Sleep</div>
            <div className="text-sm text-muted-foreground">7-9 hours of quality sleep</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <div className="text-2xl mb-2">🧘‍♀️</div>
            <div className="font-semibold text-foreground mb-1">Stress Management</div>
            <div className="text-sm text-muted-foreground">Daily meditation or breathing</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <div className="text-2xl mb-2">💧</div>
            <div className="font-semibold text-foreground mb-1">Hydration</div>
            <div className="text-sm text-muted-foreground">8-10 glasses of water daily</div>
          </div>
        </div>
      </div>
    </div>
  );
};
