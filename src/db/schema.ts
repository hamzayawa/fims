import { pgTable, text, timestamp, boolean, pgEnum, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  role: text("role", { enum: ["ADMIN", "DATA_OFFICER", "FIELD_AGENT", "VIEWER"] })
    .default("VIEWER")
    .notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
  token: text("token").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: timestamp("expiresAt"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

export const incidentSeverityEnum = pgEnum("incident_severity", ["LOW", "MODERATE", "HIGH", "CRITICAL"]);
export const incidentStatusEnum = pgEnum("incident_status", ["REPORTED", "INVESTIGATING", "MITIGATED", "RESOLVED"]);
export const alertSeverityEnum = pgEnum("alert_severity", ["INFO", "WARNING", "CRITICAL"]);

export const incidents = pgTable("incident", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lga: text("lga").notNull(),
  locationDetails: text("locationDetails"),
  severity: incidentSeverityEnum("severity").default("LOW").notNull(),
  status: incidentStatusEnum("status").default("REPORTED").notNull(),
  casualties: integer("casualties").default(0).notNull(),
  displacedPersons: integer("displacedPersons").default(0).notNull(),
  reportedBy: text("reportedBy").notNull().references(() => user.id),
  assignedTo: text("assignedTo").references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
});

export const alerts = pgTable("alert", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: alertSeverityEnum("severity").default("INFO").notNull(),
  targetLgas: jsonb("targetLgas").$type<string[]>().notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdBy: text("createdBy").notNull().references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
});

export const notifications = pgTable("notification", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => user.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  type: text("type").notNull(), // 'INCIDENT', 'ALERT', 'SYSTEM'
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const resources = pgTable("resource", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type", { enum: ["BOAT", "PUMP", "AMBULANCE", "VEHICLE", "SANDBAGS", "RELIEF_PACK"] }).notNull(),
  status: text("status", { enum: ["AVAILABLE", "DEPLOYED", "MAINTENANCE", "RETIRED"] }).default("AVAILABLE").notNull(),
  serialNumber: text("serialNumber"),
  quantity: integer("quantity").default(1).notNull(),
  currentLga: text("currentLga"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
});

export const resourceDeployments = pgTable("resource_deployment", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  resourceId: text("resourceId").notNull().references(() => resources.id),
  incidentId: text("incidentId").notNull().references(() => incidents.id),
  status: text("status", { enum: ["ACTIVE", "RETURNED"] }).default("ACTIVE").notNull(),
  deployedAt: timestamp("deployedAt").notNull().defaultNow(),
  returnedAt: timestamp("returnedAt"),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  reportedIncidents: many(incidents, { relationName: "reporter" }),
  assignedIncidents: many(incidents, { relationName: "assignee" }),
}));

export const incidentRelations = relations(incidents, ({ one, many }) => ({
  reporter: one(user, {
    fields: [incidents.reportedBy],
    references: [user.id],
    relationName: "reporter",
  }),
  assignee: one(user, {
    fields: [incidents.assignedTo],
    references: [user.id],
    relationName: "assignee",
  }),
  deployments: many(resourceDeployments),
}));

export const resourceRelations = relations(resources, ({ many }) => ({
  deployments: many(resourceDeployments),
}));

export const resourceDeploymentRelations = relations(resourceDeployments, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceDeployments.resourceId],
    references: [resources.id],
  }),
  incident: one(incidents, {
    fields: [resourceDeployments.incidentId],
    references: [incidents.id],
  }),
}));

