using QR.Client.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace QR.Client.Permissions;

public class ClientPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(ClientPermissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(ClientPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<ClientResource>(name);
    }
}
