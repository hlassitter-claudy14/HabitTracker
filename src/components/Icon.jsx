// Resolves a habit's icon (stored as a simple string, backend-friendly) to a
// Lucide component. We import only the icons we actually offer so the bundle
// stays tiny — importing the whole Lucide set would balloon it by ~600 kB.
import {
  Target, Spade, Footprints, BookOpen, Brain, Dumbbell,
  Droplets, Apple, Moon, Sun, Code, Music,
  PenLine, Heart, Coffee, Bike, Languages, Sparkles,
} from 'lucide-react';

const ICON_MAP = {
  Target, Spade, Footprints, BookOpen, Brain, Dumbbell,
  Droplets, Apple, Moon, Sun, Code, Music,
  PenLine, Heart, Coffee, Bike, Languages, Sparkles,
};

export default function Icon({ name, ...props }) {
  const Cmp = ICON_MAP[name] || Target;
  return <Cmp {...props} />;
}

// The curated set offered in the habit editor (keys of ICON_MAP).
export const ICON_CHOICES = Object.keys(ICON_MAP);
