type Id = string;

type WithId<T> = T & { _id: Id };

type WithTimeStamp<T> = T & TimeStamp;

type IdWise = { _id: Id; [k: string]: unknown };

interface Active {
  active?: boolean;
  isDeleted?: boolean;
}

interface Category {
  name: string;
  imageUrl: string;
  coverImageUrl: string;
  note: string;
  description: string;
  displayOrder?: number;
  parentCategory?: WithId<Category> | string;
}

interface Supplier {
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}

interface Product {
  name: string;
  price: number;
  stock: number;
  discount: number;
  note: string;
  imageUrl: string;
  images?: string[];
  category: WithId<Partial<Category>>;
  supplier: WithId<Partial<Supplier>>;
  description?: string;
}

interface User {
  firstName: string;
  lastName: string;
  birthday: Date;
  address: string;
  note: string;
  imageUrl: string;
}

interface Account {
  email: string;
  password: string;
  phoneNumber: string;
  isAdmin: boolean;
  Locked: boolean;
}

interface Customer extends User {
  bio?: string;
  sex?: string;
}

interface TimeStamp {
  createdDate: Date | string;
  updatedDate: Date | string;
}

interface OrderLine {
  quantity: number;
  product: WithId<Product> & { total: number };
  productId: string;
  price: number;
  discount: number;
}

interface PersonName {
  firstName: string;
  lastName: string;
}

interface Editor {
  createdBy: PersonName;
  updatedBy: PersonName;
}

interface Order {
  customer: PersonName;
  paymentType: string;
  status: string;
  shippingAddress: string;
  employee: PersonName;
  totalMoney: number;
  orderDetails: OrderLine[];
  active: boolean;
  isDeleted: boolean;
  createdDate: string;
  position: {
    name: string;
    lat: string;
    lng: string;
  };
}

interface Collection {
  name: string;
  slug?: string;
  image: string;
  coverImage: string;
  products: WithId<Product>[];
}

interface Slide {
  imageUrl: string;
  title: string;
  summary: string;
  note: string;
  active: boolean;
}

interface Message {
  sender: string;
  text: string;
  receiver: {
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  createdAt: string;
}

type GetMany<T = unknown> = {
  results: T[];
  amountResults: number;
};

type GetOne<T = unknown> = {
  result: T;
};

type GetOneOrMany<T> = GetMany<T> | GetOne<T>;

export type {
  Id,
  WithId,
  WithTimeStamp,
  Active,
  Editor,
  Account,
  Category,
  Customer,
  Product,
  User,
  Supplier,
  TimeStamp,
  Order,
  OrderLine,
  Collection,
  Slide,
  Message,
  GetMany,
  GetOne,
  GetOneOrMany,
  IdWise,
};
