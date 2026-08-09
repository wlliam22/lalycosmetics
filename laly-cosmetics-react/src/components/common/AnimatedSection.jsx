import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

const AnimatedSection = ({ children, amount = 0.2, className = '', ...props }) => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount }}
    variants={sectionVariants}
    className={className}
    {...props}
  >
    {children}
  </motion.section>
)

export default AnimatedSection