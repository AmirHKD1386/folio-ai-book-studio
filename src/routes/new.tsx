import { createFileRoute } from "@tanstack/react-router";
import { CreateWizard } from "@/components/wizard/CreateWizard";

export const Route = createFileRoute("/new")({ component: CreateWizard });
