import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "CV Management API",
    version: "1.0.0",
    description:
      "API for Authentication and CV Management (JWT + Prisma + PostgreSQL)",
  },
  servers: [{ url: "http://localhost:5000", description: "Local server" }],

  // 🔐 JWT Security Scheme
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    // ✅ Schemas (أشكال البيانات)
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "user@test.com" },
          password: { type: "string", example: "123456" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "user@test.com" },
          password: { type: "string", example: "123456" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },

      CVCreateRequest: {
        type: "object",
        required: ["title", "summary"],
        properties: {
          title: { type: "string", example: "My CV" },
          summary: { type: "string", example: "Backend developer" },
        },
      },
      CVResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "My CV" },
          summary: { type: "string", example: "Backend developer" },
          createdAt: { type: "string", example: "2026-02-20T23:21:03.235Z" },
          userId: { type: "integer", example: 6 },
        },
      },

      EducationCreateRequest: {
        type: "object",
        required: [
          "university",
          "country",
          "city",
          "degree",
          "major",
          "gpa",
          "year",
        ],
        properties: {
          university: { type: "string", example: "Damascus University" },
          country: { type: "string", example: "Syria" },
          city: { type: "string", example: "Damascus" },
          degree: { type: "string", example: "Bachelor" },
          major: { type: "string", example: "Computer Science" },
          gpa: { type: "number", example: 2.8 },
          year: { type: "integer", example: 2023 },
        },
      },

      ExperienceCreateRequest: {
        type: "object",
        required: ["company", "country", "city", "position", "startDate"],
        properties: {
          company: { type: "string", example: "ABC" },
          country: { type: "string", example: "Syria" },
          city: { type: "string", example: "Damascus" },
          position: { type: "string", example: "Backend Dev" },
          startDate: { type: "string", example: "2024-01-01" },
          endDate: { type: ["string", "null"], example: null },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Internal Server Error" },
        },
      },
      EducationResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          university: { type: "string", example: "Damascus University" },
          country: { type: "string", example: "Syria" },
          city: { type: "string", example: "Damascus" },
          degree: { type: "string", example: "Bachelor" },
          major: { type: "string", example: "Computer Science" },
          gpa: { type: "number", example: 2.8 },
          year: { type: "integer", example: 2023 },
        },
      },

      EducationUpdateRequest: {
        type: "object",
        properties: {
          university: { type: "string" },
          country: { type: "string" },
          city: { type: "string" },
          degree: { type: "string" },
          major: { type: "string" },
          gpa: { type: "number" },
          year: { type: "integer" },
        },
      },

      ExperienceResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          company: { type: "string", example: "ABC" },
          country: { type: "string", example: "Syria" },
          city: { type: "string", example: "Damascus" },
          position: { type: "string", example: "Backend Dev" },
          startDate: { type: "string", example: "2024-01-01" },
          endDate: { type: ["string", "null"], example: null },
        },
      },

      ExperienceUpdateRequest: {
        type: "object",
        properties: {
          company: { type: "string" },
          country: { type: "string" },
          city: { type: "string" },
          position: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: ["string", "null"] },
        },
      },

      ProjectCreateRequest: {
        type: "object",
        required: ["company", "name", "role", "technologies"],
        properties: {
          company: { type: "string", example: "ABC" },
          name: { type: "string", example: "E-commerce System" },
          role: { type: "string", example: "Backend Developer" },
          technologies: { type: "string", example: "Node.js, PostgreSQL" },
        },
      },

      ProjectResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          company: { type: "string" },
          name: { type: "string" },
          role: { type: "string" },
          technologies: { type: "string" },
        },
      },

      ProjectUpdateRequest: {
        type: "object",
        properties: {
          company: { type: "string" },
          name: { type: "string" },
          role: { type: "string" },
          technologies: { type: "string" },
        },
      },

      SkillCreateRequest: {
        type: "object",
        required: ["name", "level"],
        properties: {
          name: { type: "string", example: "JavaScript" },
          level: { type: "integer", example: 85 },
        },
      },

      SkillResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string" },
          level: { type: "integer" },
        },
      },

      SkillUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          level: { type: "integer" },
        },
      },

      SuccessResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Deleted successfully" },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  // 🔎 هنا نحدد أين يبحث swagger-jsdoc عن التعليقات
  apis: ["./src/app.js", "./src/routes/*.js"],
};
export const swaggerSpec = swaggerJSDoc(options);
