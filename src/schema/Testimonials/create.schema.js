import * as Yup from 'yup'; 

export const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  designation: Yup.string()
    .required("Designation is required")
    .min(2, "Designation must be at least 2 characters")
    .max(50, "Designation cannot exceed 50 characters")
    .trim(),
  company: Yup.string()
    .required("Company is required")
    .min(2, "Company must be at least 2 characters")
    .max(100, "Company cannot exceed 100 characters")
    .trim(),
  testimonial: Yup.string()
    .required("Testimonial is required")
    .min(10, "Testimonial must be at least 10 characters")
    .max(500, "Testimonial cannot exceed 500 characters")
    .trim(),
  image: Yup.mixed()
    .required("Image is required")
    .test("is-valid-image", "Image must be a valid file or URL", (value) => {
      return typeof value === "string" || value instanceof File;
    }),
  order: Yup.number()
    .required("Order is required")
    .positive("Order must be a positive number")
    .integer("Order must be an integer")
    .typeError("Order must be a number"),
  isActive: Yup.boolean().default(true),
});

