export type FieldType = 'string' | 'number' | 'boolean' | 'options';
export type UserRole = 'owner' | 'editor' | 'viewer';

export interface Project {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectMember {
    id: string; // projectId_userId
    projectId: string;
    userId: string;
    userName: string;
    userEmail: string;
    role: UserRole;
    addedAt: Date;
}

export interface FieldConfig {
    // For number fields
    isCurrency?: boolean;
    currencyCode?: string;
    hasFormula?: boolean;
    formula?: string;

    // For options fields (future)
    options?: string[];
    allowMultiple?: boolean;
}

export interface FieldDefinition {
    id: string;
    collectionId: string;
    name: string;
    type: FieldType;
    config: FieldConfig;
    order: number;
    required: boolean;
}

export interface Collection {
    id: string;
    projectId: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DataRecord {
    id: string;
    collectionId: string;
    projectId: string;
    data: { [fieldId: string]: any };
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
