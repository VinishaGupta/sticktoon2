
export interface Badge {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  details: string;
  isFeatured?: boolean;
  color: string;
}

export interface CartItem extends Badge {
  quantity: number;
}

export interface User {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export enum Category {
  MOODY = 'Moody',
  SPORTS = 'Sports',
  RELIGIOUS = 'Religious',
  ENTERTAINMENT = 'Entertainment',
  EVENTS = 'Events',
  ANIMAL = 'Animal',
  COUPLE = 'Couple',
  ANIME = 'Anime'
}

export interface AppState {
  cart: CartItem[];
  user: User | null;
  selectedCategory: string | null;
}
