import { motion } from 'framer-motion'

export default function EmptyState({ icon, title, description, action }) {
    return (
        <motion.div
            className="empty-state-premium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div
                className="empty-state-icon-premium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.4 }}
            >
                {icon}
            </motion.div>

            <motion.h3
                className="empty-state-title-premium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {title}
            </motion.h3>

            <motion.p
                className="empty-state-description-premium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {description}
            </motion.p>

            {action && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    )
}
