import * as yup from 'yup';

export const blogSchema = yup.object().shape({
    title: yup.string().required('Title is required').max(150, 'Title cannot exceed 150 characters'),
    description: yup.string().required('Description is required').max(300, 'Description cannot exceed 300 characters'),
    content: yup.string().required('Content is required'),
    metaTitle: yup.string().max(60, 'Meta Title cannot exceed 60 characters'),
    metaDescription: yup.string().max(160, 'Meta Description cannot exceed 160 characters'),
    metaKeywords: yup.array().of(yup.string()),
    authorId: yup.string().required('Author is required'),
    tags: yup.array().of(
        yup.object().shape({
            id: yup.string().required(),
            name: yup.string().required()

        })
    ).min(1, 'At least one tag is required'),
    readTime: yup.number().typeError('Read Time must be a number').positive('Read Time must be positive').integer('Read Time must be an integer').required('Read Time is required'),
    status: yup.string().oneOf(['draft', 'published'], 'Status must be either draft or published').required('Status is required'),
    metaImage: yup.string().required('Meta Image is required'),
});