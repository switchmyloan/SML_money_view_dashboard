import * as Yup from 'yup'

export const validationPressSchema = Yup.object().shape({
    title: Yup.string()
        .required("Title is required")
        .min(2, "Title must be at least 2 characters")
        .max(100, "Title cannot exceed 100 characters")
        .trim(),
      description: Yup.string()
        .required("Description is required")
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description cannot exceed 500 characters")
        .trim(),
      image: Yup.mixed()
        .required("Image is required")
        .test("is-valid-image", "Image must be a valid file or URL", (value) => {
          return typeof value === "string" || value instanceof File;
        }),
      sourceLogo: Yup.mixed()
        .required("Source Logo is required")
        .test("is-valid-image", "Source Logo must be a valid file or URL", (value) => {
          return typeof value === "string" || value instanceof File;
        }),
      redirectLink: Yup.string().trim(),
      status: Yup.string()
        .required("Status is required")
        .oneOf(["draft", "published", "archived", "reviewed"], "Invalid status"),
})