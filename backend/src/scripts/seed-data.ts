import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { Application } from '../entities/application.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Form } from '../entities/form.entity';
import { FormField, FieldType } from '../entities/form-field.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'tenant_generator',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
});

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Starting database seeding...');

    const applicationRepository = AppDataSource.getRepository(Application);
    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);
    const formRepository = AppDataSource.getRepository(Form);
    const formFieldRepository = AppDataSource.getRepository(FormField);

    // Create default application
    const defaultApp = applicationRepository.create({
      id: uuidv4(),
      name: 'Demo Application',
      code: 'demo_app',
      db_name: 'demo_app_db',
      description: 'Default demo application for testing',
      domain: 'demo.localhost',
      active: true,
      created_by: uuidv4(),
    });
    await applicationRepository.save(defaultApp);
    console.log('✅ Created default application');

    // Create default roles
    const adminRole = roleRepository.create({
      id: uuidv4(),
      name: 'Administrator',
      description: 'Full system access',
      app_id: defaultApp.id,
      active: true,
    });
    await roleRepository.save(adminRole);

    const userRole = roleRepository.create({
      id: uuidv4(),
      name: 'User',
      description: 'Basic user access',
      app_id: defaultApp.id,
      active: true,
    });
    await roleRepository.save(userRole);
    console.log('✅ Created default roles');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = userRepository.create({
      id: uuidv4(),
      username: 'admin',
      email: 'admin@demo.com',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      active: true,
      app_id: defaultApp.id,
      role_id: adminRole.id,
    });
    await userRepository.save(adminUser);
    console.log('✅ Created default admin user (admin/admin123)');

    // Create sample form
    const sampleForm = formRepository.create({
      id: uuidv4(),
      code: 'user_profile',
      name: 'User Profile',
      description: 'Sample user profile form',
      is_custom: false,
      app_id: defaultApp.id,
      table_name: 'user_profiles',
      active: true,
    });
    await formRepository.save(sampleForm);

    // Create sample form fields
    const formFields = [
      {
        field_name: 'first_name',
        label: 'First Name',
        field_type: FieldType.TEXTBOX,
        required: true,
        order_index: 1,
      },
      {
        field_name: 'last_name',
        label: 'Last Name',
        field_type: FieldType.TEXTBOX,
        required: true,
        order_index: 2,
      },
      {
        field_name: 'email',
        label: 'Email Address',
        field_type: FieldType.TEXTBOX,
        required: true,
        order_index: 3,
        validation_rules: JSON.stringify({ type: 'email' }),
      },
      {
        field_name: 'birth_date',
        label: 'Date of Birth',
        field_type: FieldType.DATE,
        required: false,
        order_index: 4,
      },
      {
        field_name: 'gender',
        label: 'Gender',
        field_type: FieldType.DROPDOWN_STATIC,
        required: false,
        order_index: 5,
        options: JSON.stringify([
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ]),
      },
      {
        field_name: 'bio',
        label: 'Biography',
        field_type: FieldType.TEXTAREA,
        required: false,
        order_index: 6,
        placeholder: 'Tell us about yourself...',
      },
    ];

    for (const fieldData of formFields) {
      const field = formFieldRepository.create({
        id: uuidv4(),
        form_id: sampleForm.id,
        ...fieldData,
      });
      await formFieldRepository.save(field);
    }
    console.log('✅ Created sample form with fields');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📝 Default login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedData();