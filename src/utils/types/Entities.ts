type Id = string;

type WithId<T> = T & { _id: Id };

type WithTimeStamp<T> = T & TimeStamp;

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
  product: Product & { total: number };
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
}

interface Collection {
  name: string;
  image: string;
  coverImage: string;
  products: Product[];
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

type GetMany<T> = {
  results: T[];
  amountResults: number;
}

type GetOne<T> = {
  result: T;
}

type GetOneOrMany<T> = GetMany<T> | GetOne<T>

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
  GetOneOrMany
};
