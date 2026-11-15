import type {
  ManagedMenuCategory,
  ManagedMenuItem,
} from "@/entities/menu-item";

// Какое окно редактора открыто сейчас; одновременно — не больше одного.
export type EditorDialog =
  | { kind: "item-form"; item?: ManagedMenuItem; categoryId?: number }
  | { kind: "item-delete"; item: ManagedMenuItem }
  | { kind: "category-form"; category?: ManagedMenuCategory }
  | { kind: "category-delete"; category: ManagedMenuCategory }
  | null;

export type EditorActions = {
  addItem: (categoryId: number) => void;
  editItem: (item: ManagedMenuItem) => void;
  deleteItem: (item: ManagedMenuItem) => void;
  renameCategory: (category: ManagedMenuCategory) => void;
  deleteCategory: (category: ManagedMenuCategory) => void;
};
