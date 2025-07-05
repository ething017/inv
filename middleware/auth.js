export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'يجب تسجيل الدخول للوصول إلى هذه الصفحة');
    return res.redirect('/auth/login');
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('error', 'ليس لديك صلاحية للوصول إلى هذه الصفحة');
    return res.redirect('/dashboard');
  }
  next();
};

// Legacy permission check for backward compatibility
export const checkPermission = (permission) => {
  return (req, res, next) => {
    // SUPER ADMIN BYPASS: If user is admin, grant access to everything
    if (req.session.user.role === 'admin') {
      return next();
    }
    
    if (!req.session.user.permissions[permission]) {
      req.flash('error', 'ليس لديك صلاحية لتنفيذ هذا الإجراء');
      return res.redirect('/dashboard');
    }
    next();
  };
};

// New fine-grained permission check
export const requirePermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // SUPER ADMIN BYPASS: If user is admin, grant access to everything
      if (req.session.user.role === 'admin') {
        return next();
      }

      // Import User model dynamically to avoid circular dependency
      const { default: User } = await import('../models/User.js');
      const user = await User.findById(req.session.user.id);
      
      if (!user) {
        req.flash('error', 'المستخدم غير موجود');
        return res.redirect('/auth/login');
      }

      const hasPermission = await user.hasPermission(module, action);
      
      if (!hasPermission) {
        req.flash('error', 'ليس لديك صلاحية لتنفيذ هذا الإجراء');
        return res.redirect('/dashboard');
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      req.flash('error', 'حدث خطأ أثناء التحقق من الصلاحيات');
      return res.redirect('/dashboard');
    }
  };
};

// Helper middleware to load user permissions into session
export const loadUserPermissions = async (req, res, next) => {
  if (req.session.user) {
    // SUPER ADMIN BYPASS: If user is admin, they have all permissions
    if (req.session.user.role === 'admin') {
      req.session.user.detailedPermissions = 'ALL'; // Special marker for admin
      return next();
    }
    
    if (req.session.user.role !== 'admin') {
      try {
        const { default: User } = await import('../models/User.js');
        const user = await User.findById(req.session.user.id);
        
        if (user) {
          const permissions = await user.getAllPermissions();
          req.session.user.detailedPermissions = permissions;
        }
      } catch (error) {
        console.error('Error loading user permissions:', error);
      }
    }
  }
  next();
};

// Check if user has any permission for a module (view_own or view_all)
export const requireModuleAccess = (module) => {
  return async (req, res, next) => {
    try {
      // SUPER ADMIN BYPASS: If user is admin, grant access to everything
      if (req.session.user.role === 'admin') {
        // Set full permissions for admin
        req.userPermissionLevel = {
          canViewOwn: true,
          canViewAll: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true
        };
        return next();
      }

      const { default: User } = await import('../models/User.js');
      const user = await User.findById(req.session.user.id);
      
      if (!user) {
        req.flash('error', 'المستخدم غير موجود');
        return res.redirect('/auth/login');
      }

      const hasViewOwn = await user.hasPermission(module, 'view_own');
      const hasViewAll = await user.hasPermission(module, 'view_all');
      
      if (!hasViewOwn && !hasViewAll) {
        req.flash('error', 'ليس لديك صلاحية للوصول إلى هذا القسم');
        return res.redirect('/dashboard');
      }

      // Store permission level in request for use in routes
      req.userPermissionLevel = {
        canViewOwn: hasViewOwn,
        canViewAll: hasViewAll,
        canCreate: await user.hasPermission(module, 'create'),
        canUpdate: await user.hasPermission(module, 'update'),
        canDelete: await user.hasPermission(module, 'delete')
      };

      next();
    } catch (error) {
      console.error('Module access check error:', error);
      req.flash('error', 'حدث خطأ أثناء التحقق من الصلاحيات');
      return res.redirect('/dashboard');
    }
  };
};

// New middleware specifically for super admin operations
export const requireSuperAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('error', 'هذه العملية تتطلب صلاحيات مدير النظام الرئيسي');
    return res.redirect('/dashboard');
  }
  next();
};

// Middleware to check if user can access system-wide features
export const requireSystemAccess = (req, res, next) => {
  // Only admins can access system-wide features
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('error', 'ليس لديك صلاحية للوصول إلى إعدادات النظام');
    return res.redirect('/dashboard');
  }
  next();
};