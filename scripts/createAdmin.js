import mongoose from 'mongoose';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import dotenv from 'dotenv';

dotenv.config();

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arabic-invoice-system');
    console.log('MongoDB connected');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists. Updating permissions...');
      await updateExistingAdmin(existingAdmin);
      return;
    }
    
    // Ensure all permissions exist
    await ensureAllPermissionsExist();
    
    // Get all permissions
    const allPermissions = await Permission.find();
    console.log(`Found ${allPermissions.length} permissions in the system`);
    
    // Create or update admin role with ALL permissions
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = new Role({
        name: 'admin',
        displayName: 'مدير النظام الرئيسي',
        description: 'صلاحيات كاملة وغير محدودة على جميع أجزاء النظام',
        permissions: allPermissions.map(p => p._id),
        isSystemRole: true,
        isActive: true
      });
      await adminRole.save();
      console.log('Admin role created with ALL permissions');
    } else {
      // Update existing admin role to have ALL permissions
      adminRole.permissions = allPermissions.map(p => p._id);
      adminRole.displayName = 'مدير النظام الرئيسي';
      adminRole.description = 'صلاحيات كاملة وغير محدودة على جميع أجزاء النظام';
      adminRole.isSystemRole = true;
      adminRole.isActive = true;
      await adminRole.save();
      console.log('Admin role updated with ALL permissions');
    }
    
    // Create super admin user with full legacy permissions
    const superAdmin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin', // This ensures admin bypass in middleware
      roles: [adminRole._id], // New role-based system
      commissionRate: 0, // Admin doesn't need commission
      // Legacy permissions - set ALL to true for backward compatibility
      permissions: {
        canCreateCompanies: true,
        canCreateInvoices: true,
        canManageClients: true,
        canViewReports: true,
        // Add any other legacy permissions that might exist
        canManageDistributors: true,
        canManageFiles: true,
        canManageCommissionTiers: true,
        canManageRoles: true,
        canManagePermissions: true,
        canAccessSystemSettings: true,
        canViewAllData: true,
        canDeleteAnyData: true,
        canExportData: true,
        canManageSystem: true
      },
      isActive: true
    });
    
    await superAdmin.save();
    
    console.log('✅ Super Admin created successfully!');
    console.log('📋 Admin Details:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: admin (system-wide access)');
    console.log(`   Permissions: ${allPermissions.length} (ALL PERMISSIONS)`);
    console.log('   Legacy Permissions: ALL SET TO TRUE');
    console.log('');
    console.log('🔐 Security Notes:');
    console.log('   - This admin has UNLIMITED access to ALL system features');
    console.log('   - Can create, read, update, delete ANY data in the system');
    console.log('   - Can manage users, roles, and permissions');
    console.log('   - Can access all reports and export all data');
    console.log('   - Please change the default password after first login');
    console.log('');
    console.log('🚀 The admin is ready to use the system without any restrictions!');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

async function updateExistingAdmin(admin) {
  try {
    // Get all permissions
    const allPermissions = await Permission.find();
    
    // Update admin role to have ALL permissions
    let adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      adminRole.permissions = allPermissions.map(p => p._id);
      adminRole.displayName = 'مدير النظام الرئيسي';
      adminRole.description = 'صلاحيات كاملة وغير محدودة على جميع أجزاء النظام';
      adminRole.isSystemRole = true;
      adminRole.isActive = true;
      await adminRole.save();
    }
    
    // Update admin user with full permissions
    admin.role = 'admin'; // Ensure admin role
    admin.roles = adminRole ? [adminRole._id] : [];
    admin.permissions = {
      canCreateCompanies: true,
      canCreateInvoices: true,
      canManageClients: true,
      canViewReports: true,
      canManageDistributors: true,
      canManageFiles: true,
      canManageCommissionTiers: true,
      canManageRoles: true,
      canManagePermissions: true,
      canAccessSystemSettings: true,
      canViewAllData: true,
      canDeleteAnyData: true,
      canExportData: true,
      canManageSystem: true
    };
    admin.isActive = true;
    
    await admin.save();
    
    console.log('✅ Existing admin updated with full permissions!');
    console.log('📋 Updated Admin Details:');
    console.log(`   Username: ${admin.username}`);
    console.log('   Role: admin (system-wide access)');
    console.log(`   Permissions: ${allPermissions.length} (ALL PERMISSIONS)`);
    console.log('   Legacy Permissions: ALL SET TO TRUE');
    console.log('');
    console.log('🔐 The admin now has UNLIMITED access to ALL system features!');
    
  } catch (error) {
    console.error('❌ Error updating existing admin:', error);
    throw error;
  }
}

async function ensureAllPermissionsExist() {
  const requiredPermissions = [
    // Companies
    { name: 'companies.view_own', displayName: 'عرض الشركات الخاصة', module: 'companies', action: 'view_own', description: 'عرض الشركات التي أنشأها المستخدم' },
    { name: 'companies.view_all', displayName: 'عرض جميع الشركات', module: 'companies', action: 'view_all', description: 'عرض جميع الشركات في النظام' },
    { name: 'companies.create', displayName: 'إنشاء شركة', module: 'companies', action: 'create', description: 'إضافة شركات جديدة' },
    { name: 'companies.update', displayName: 'تعديل شركة', module: 'companies', action: 'update', description: 'تحديث بيانات الشركات' },
    { name: 'companies.delete', displayName: 'حذف شركة', module: 'companies', action: 'delete', description: 'حذف الشركات' },

    // Clients
    { name: 'clients.view_own', displayName: 'عرض العملاء الخاصين', module: 'clients', action: 'view_own', description: 'عرض العملاء التي أنشأها المستخدم' },
    { name: 'clients.view_all', displayName: 'عرض جميع العملاء', module: 'clients', action: 'view_all', description: 'عرض جميع العملاء في النظام' },
    { name: 'clients.create', displayName: 'إنشاء عميل', module: 'clients', action: 'create', description: 'إضافة عملاء جدد' },
    { name: 'clients.update', displayName: 'تعديل عميل', module: 'clients', action: 'update', description: 'تحديث بيانات العملاء' },
    { name: 'clients.delete', displayName: 'حذف عميل', module: 'clients', action: 'delete', description: 'حذف العملاء' },

    // Files
    { name: 'files.view_own', displayName: 'عرض الملفات الخاصة', module: 'files', action: 'view_own', description: 'عرض الملفات التي أنشأها المستخدم' },
    { name: 'files.view_all', displayName: 'عرض جميع الملفات', module: 'files', action: 'view_all', description: 'عرض جميع الملفات في النظام' },
    { name: 'files.create', displayName: 'إنشاء ملف', module: 'files', action: 'create', description: 'إضافة ملفات جديدة' },
    { name: 'files.update', displayName: 'تعديل ملف', module: 'files', action: 'update', description: 'تحديث بيانات الملفات' },
    { name: 'files.delete', displayName: 'حذف ملف', module: 'files', action: 'delete', description: 'حذف الملفات' },

    // Invoices
    { name: 'invoices.view_own', displayName: 'عرض الفواتير الخاصة', module: 'invoices', action: 'view_own', description: 'عرض الفواتير المكلف بها المستخدم' },
    { name: 'invoices.view_all', displayName: 'عرض جميع الفواتير', module: 'invoices', action: 'view_all', description: 'عرض جميع الفواتير في النظام' },
    { name: 'invoices.create', displayName: 'إنشاء فاتورة', module: 'invoices', action: 'create', description: 'إضافة فواتير جديدة' },
    { name: 'invoices.update', displayName: 'تعديل فاتورة', module: 'invoices', action: 'update', description: 'تحديث بيانات الفواتير' },
    { name: 'invoices.delete', displayName: 'حذف فاتورة', module: 'invoices', action: 'delete', description: 'حذف الفواتير' },

    // Distributors
    { name: 'distributors.view_own', displayName: 'عرض الملف الشخصي', module: 'distributors', action: 'view_own', description: 'عرض الملف الشخصي للموزع' },
    { name: 'distributors.view_all', displayName: 'عرض جميع الموزعين', module: 'distributors', action: 'view_all', description: 'عرض جميع الموزعين في النظام' },
    { name: 'distributors.create', displayName: 'إنشاء موزع', module: 'distributors', action: 'create', description: 'إضافة موزعين جدد' },
    { name: 'distributors.update', displayName: 'تعديل موزع', module: 'distributors', action: 'update', description: 'تحديث بيانات الموزعين' },
    { name: 'distributors.delete', displayName: 'حذف موزع', module: 'distributors', action: 'delete', description: 'حذف الموزعين' },

    // Reports
    { name: 'reports.view_own', displayName: 'عرض التقارير الخاصة', module: 'reports', action: 'view_own', description: 'عرض تقارير المستخدم فقط' },
    { name: 'reports.view_all', displayName: 'عرض جميع التقارير', module: 'reports', action: 'view_all', description: 'عرض جميع التقارير في النظام' },

    // Commission Tiers
    { name: 'commission-tiers.view_own', displayName: 'عرض مستويات العمولة الخاصة', module: 'commission-tiers', action: 'view_own', description: 'عرض مستويات العمولة التي أنشأها المستخدم' },
    { name: 'commission-tiers.view_all', displayName: 'عرض جميع مستويات العمولة', module: 'commission-tiers', action: 'view_all', description: 'عرض جميع مستويات العمولة' },
    { name: 'commission-tiers.create', displayName: 'إنشاء مستوى عمولة', module: 'commission-tiers', action: 'create', description: 'إضافة مستويات عمولة جديدة' },
    { name: 'commission-tiers.update', displayName: 'تعديل مستوى عمولة', module: 'commission-tiers', action: 'update', description: 'تحديث مستويات العمولة' },
    { name: 'commission-tiers.delete', displayName: 'حذف مستوى عمولة', module: 'commission-tiers', action: 'delete', description: 'حذف مستويات العمولة' },

    // Roles
    { name: 'roles.view_all', displayName: 'عرض جميع الأدوار', module: 'roles', action: 'view_all', description: 'عرض جميع الأدوار في النظام' },
    { name: 'roles.create', displayName: 'إنشاء دور', module: 'roles', action: 'create', description: 'إضافة أدوار جديدة' },
    { name: 'roles.update', displayName: 'تعديل دور', module: 'roles', action: 'update', description: 'تحديث الأدوار' },
    { name: 'roles.delete', displayName: 'حذف دور', module: 'roles', action: 'delete', description: 'حذف الأدوار' },

    // Permissions
    { name: 'permissions.view_all', displayName: 'عرض جميع الصلاحيات', module: 'permissions', action: 'view_all', description: 'عرض جميع الصلاحيات في النظام' },
    { name: 'permissions.create', displayName: 'إنشاء صلاحية', module: 'permissions', action: 'create', description: 'إضافة صلاحيات جديدة' },
    { name: 'permissions.update', displayName: 'تعديل صلاحية', module: 'permissions', action: 'update', description: 'تحديث الصلاحيات' },
    { name: 'permissions.delete', displayName: 'حذف صلاحية', module: 'permissions', action: 'delete', description: 'حذف الصلاحيات' },

    // System
    { name: 'system.manage', displayName: 'إدارة النظام', module: 'system', action: 'manage', description: 'إدارة إعدادات النظام العامة' },
    { name: 'system.backup', displayName: 'نسخ احتياطي', module: 'system', action: 'backup', description: 'إنشاء واستعادة النسخ الاحتياطية' },
    { name: 'system.export', displayName: 'تصدير البيانات', module: 'system', action: 'export', description: 'تصدير جميع بيانات النظام' },
    { name: 'system.import', displayName: 'استيراد البيانات', module: 'system', action: 'import', description: 'استيراد البيانات للنظام' }
  ];

  for (const permData of requiredPermissions) {
    const existingPerm = await Permission.findOne({ name: permData.name });
    if (!existingPerm) {
      await Permission.create({
        ...permData,
        isSystemPermission: true
      });
      console.log(`Created permission: ${permData.name}`);
    }
  }
}

// Run the script
createSuperAdmin().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});