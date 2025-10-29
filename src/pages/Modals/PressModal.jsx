import React from "react";
import ValidatedTextField from "../../components/Form/ValidatedTextField";
import ValidatedTextArea from "../../components/Form/ValidatedTextArea";
import ValidatedLabel from "../../components/Form/ValidatedLabel";
import { Controller } from "react-hook-form";
import ValidatedSearchableSelectField from "../../components/Form/ValidatedSearchableSelectField";
import ImageUploadField from "../../components/Form/ImageUploadField";

const FormRow = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const PressModal = ({
    isModalOpen,
    setIsModalOpen,
    isEditMode,
    setIsEditMode,
    reset,
    handleSubmit,
    onSubmit,
    control,
    register,
    errors,
    setGlobalFilter,
}) => {
    if (!isModalOpen) return null;

    return (
        <dialog id="press_modal" className="modal modal-open"
            onClick={(e) => {
                console.log(e.target, "e.target")
                // agar backdrop pe click hua (modal ke andar nahi)
                if (e.target.id === "press_modal") {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    // reset();
                }
            }}
        >
            <div className="modal-box w-full max-w-2xl">
                <h2 className="mb-3 text-xl font-bold border-b pb-2">
                    {isEditMode ? "Update Press" : "Create Press"}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Title + Image */}
                    <FormRow>
                        <ValidatedTextField
                            name="title"
                            control={control}
                            rules={{ required: "Title is required" }}
                            label="Title"
                            placeholder="Enter Press Title"
                            errors={errors}
                            helperText="Title is required!"
                        />

                        <ValidatedTextField
                            name="image"
                            control={control}
                            rules={{ required: "Image is required" }}
                            label="Image"
                            placeholder="Enter Image URL"
                            errors={errors}
                            helperText="Image is required!"
                        />
                    </FormRow>

                    {/* Redirect Link */}
                    <FormRow>
                        <ValidatedTextField
                            name="redirectLink"
                            control={control}
                            rules={{ required: "Redirect link is required" }}
                            label="Redirect Link"
                            placeholder="Enter Redirect Link"
                            errors={errors}
                            helperText="Redirect link is required!"
                        />
                        <ValidatedSearchableSelectField
                            name="status"
                            control={control}
                            rules={{ required: "Status is required" }}
                            label="Select Status"
                            options={[{ label: "Draft", value: "draft" }]}
                            errors={errors}
                            setGlobalFilter={setGlobalFilter}
                        />
                    </FormRow>

                    {/* Description full width */}
                    <ValidatedTextArea
                        name="description"
                        control={control}
                        label="Description"
                        errors={errors}
                        placeholder="Enter Press Description"
                        rows={3}
                        rules={{ required: "Description is required" }}
                    />

                    {/* Status + Source Logo */}
                    <FormRow>
                        <div>
                            <ValidatedLabel label="Source Logo" />
                            <ImageUploadField
                                name="sourceLogo"
                                control={control}
                                label="Source Logo"
                                errors={errors}
                                rules={{ required: "Source logo is required" }}
                            />
                        </div>

                    </FormRow>

                    {/* Actions */}
                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setIsEditMode(false);
                                reset();
                            }}
                            className="btn"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEditMode ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default PressModal;
