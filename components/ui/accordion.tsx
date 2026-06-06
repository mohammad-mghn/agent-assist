import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn(
			"overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-1",
			className,
		)}
		{...props}
	/>
));
AccordionItem.displayName = "AccordionItem";

const AccordionHeader = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Header>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Header
		ref={ref}
		className={cn("flex items-center", className)}
		{...props}
	/>
));
AccordionHeader.displayName = AccordionPrimitive.Header.displayName;

const AccordionTrigger = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Trigger
		ref={ref}
		className={cn(
			"flex min-w-0 flex-1 cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1 text-start text-sm font-medium transition-colors hover:bg-[var(--color-muted)]/60 [&[data-state=open]_.chevron]:rotate-180",
			className,
		)}
		{...props}
	>
		{children}
	</AccordionPrimitive.Trigger>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Content
		ref={ref}
		className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
		{...props}
	>
		<div className={cn("px-1 pb-1 pt-1", className)}>{children}</div>
	</AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
	Accordion,
	AccordionItem,
	AccordionHeader,
	AccordionTrigger,
	AccordionContent,
};
